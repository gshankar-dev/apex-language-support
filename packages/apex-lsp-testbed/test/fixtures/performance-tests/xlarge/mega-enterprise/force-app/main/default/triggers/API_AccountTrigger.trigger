trigger API_AccountTrigger on Account (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    API_BaseService_511.ServiceConfig config =
        new API_BaseService_511.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            API_Domain_518 domain =
                new API_Domain_518();
            API_Domain_518.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (API_Domain_518.ValidationError err : validation.errors) {
                    if (err.severity == API_Domain_518.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        API_RecordService_513 service =
            new API_RecordService_513();
        API_BaseService_511.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'API trigger error: ' + error);
            }
        }
    }
}
