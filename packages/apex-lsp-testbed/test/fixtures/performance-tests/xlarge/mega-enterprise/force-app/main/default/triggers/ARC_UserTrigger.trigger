trigger ARC_UserTrigger on User (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    ARC_BaseService_241.ServiceConfig config =
        new ARC_BaseService_241.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            ARC_Domain_248 domain =
                new ARC_Domain_248();
            ARC_Domain_248.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (ARC_Domain_248.ValidationError err : validation.errors) {
                    if (err.severity == ARC_Domain_248.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        ARC_RecordService_243 service =
            new ARC_RecordService_243();
        ARC_BaseService_241.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'ARC trigger error: ' + error);
            }
        }
    }
}
