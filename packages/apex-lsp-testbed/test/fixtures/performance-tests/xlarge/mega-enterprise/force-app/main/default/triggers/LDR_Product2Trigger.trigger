trigger LDR_Product2Trigger on Product2 (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    LDR_BaseService_621.ServiceConfig config =
        new LDR_BaseService_621.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            LDR_Domain_628 domain =
                new LDR_Domain_628();
            LDR_Domain_628.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (LDR_Domain_628.ValidationError err : validation.errors) {
                    if (err.severity == LDR_Domain_628.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        LDR_RecordService_623 service =
            new LDR_RecordService_623();
        LDR_BaseService_621.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'LDR trigger error: ' + error);
            }
        }
    }
}
