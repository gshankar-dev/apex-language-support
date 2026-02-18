trigger LOG_ContactTrigger on Contact (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    LOG_BaseService_181.ServiceConfig config =
        new LOG_BaseService_181.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            LOG_Domain_188 domain =
                new LOG_Domain_188();
            LOG_Domain_188.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (LOG_Domain_188.ValidationError err : validation.errors) {
                    if (err.severity == LOG_Domain_188.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        LOG_RecordService_183 service =
            new LOG_RecordService_183();
        LOG_BaseService_181.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'LOG trigger error: ' + error);
            }
        }
    }
}
