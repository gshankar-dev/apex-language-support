trigger REC_AccountTrigger on Account (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    REC_BaseService_681.ServiceConfig config =
        new REC_BaseService_681.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            REC_Domain_688 domain =
                new REC_Domain_688();
            REC_Domain_688.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (REC_Domain_688.ValidationError err : validation.errors) {
                    if (err.severity == REC_Domain_688.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        REC_RecordService_683 service =
            new REC_RecordService_683();
        REC_BaseService_681.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'REC trigger error: ' + error);
            }
        }
    }
}
