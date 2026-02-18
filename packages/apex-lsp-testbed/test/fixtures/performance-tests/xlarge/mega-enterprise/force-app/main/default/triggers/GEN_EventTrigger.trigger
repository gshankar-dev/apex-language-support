trigger GEN_EventTrigger on Event (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    GEN_BaseService_571.ServiceConfig config =
        new GEN_BaseService_571.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            GEN_Domain_578 domain =
                new GEN_Domain_578();
            GEN_Domain_578.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (GEN_Domain_578.ValidationError err : validation.errors) {
                    if (err.severity == GEN_Domain_578.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        GEN_RecordService_573 service =
            new GEN_RecordService_573();
        GEN_BaseService_571.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'GEN trigger error: ' + error);
            }
        }
    }
}
