trigger DAT_OrderTrigger on Order (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    DAT_BaseService_271.ServiceConfig config =
        new DAT_BaseService_271.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            DAT_Domain_278 domain =
                new DAT_Domain_278();
            DAT_Domain_278.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (DAT_Domain_278.ValidationError err : validation.errors) {
                    if (err.severity == DAT_Domain_278.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        DAT_RecordService_273 service =
            new DAT_RecordService_273();
        DAT_BaseService_271.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'DAT trigger error: ' + error);
            }
        }
    }
}
