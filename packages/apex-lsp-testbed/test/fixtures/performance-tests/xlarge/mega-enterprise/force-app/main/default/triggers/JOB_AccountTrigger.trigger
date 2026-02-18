trigger JOB_AccountTrigger on Account (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    JOB_BaseService_341.ServiceConfig config =
        new JOB_BaseService_341.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            JOB_Domain_348 domain =
                new JOB_Domain_348();
            JOB_Domain_348.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (JOB_Domain_348.ValidationError err : validation.errors) {
                    if (err.severity == JOB_Domain_348.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        JOB_RecordService_343 service =
            new JOB_RecordService_343();
        JOB_BaseService_341.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'JOB trigger error: ' + error);
            }
        }
    }
}
