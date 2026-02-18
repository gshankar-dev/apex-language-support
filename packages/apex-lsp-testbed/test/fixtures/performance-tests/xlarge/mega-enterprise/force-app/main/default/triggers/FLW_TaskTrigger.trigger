trigger FLW_TaskTrigger on Task (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    FLW_BaseService_561.ServiceConfig config =
        new FLW_BaseService_561.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            FLW_Domain_568 domain =
                new FLW_Domain_568();
            FLW_Domain_568.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (FLW_Domain_568.ValidationError err : validation.errors) {
                    if (err.severity == FLW_Domain_568.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        FLW_RecordService_563 service =
            new FLW_RecordService_563();
        FLW_BaseService_561.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'FLW trigger error: ' + error);
            }
        }
    }
}
