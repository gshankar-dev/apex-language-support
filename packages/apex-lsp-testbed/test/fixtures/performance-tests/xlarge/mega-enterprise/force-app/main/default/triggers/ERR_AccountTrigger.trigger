trigger ERR_AccountTrigger on Account (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    ERR_BaseService_171.ServiceConfig config =
        new ERR_BaseService_171.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            ERR_Domain_178 domain =
                new ERR_Domain_178();
            ERR_Domain_178.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (ERR_Domain_178.ValidationError err : validation.errors) {
                    if (err.severity == ERR_Domain_178.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        ERR_RecordService_173 service =
            new ERR_RecordService_173();
        ERR_BaseService_171.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'ERR trigger error: ' + error);
            }
        }
    }
}
