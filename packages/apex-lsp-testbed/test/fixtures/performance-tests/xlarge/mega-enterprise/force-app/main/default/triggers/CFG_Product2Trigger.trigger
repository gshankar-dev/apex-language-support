trigger CFG_Product2Trigger on Product2 (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    CFG_BaseService_791.ServiceConfig config =
        new CFG_BaseService_791.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            CFG_Domain_798 domain =
                new CFG_Domain_798();
            CFG_Domain_798.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (CFG_Domain_798.ValidationError err : validation.errors) {
                    if (err.severity == CFG_Domain_798.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        CFG_RecordService_793 service =
            new CFG_RecordService_793();
        CFG_BaseService_791.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'CFG trigger error: ' + error);
            }
        }
    }
}
