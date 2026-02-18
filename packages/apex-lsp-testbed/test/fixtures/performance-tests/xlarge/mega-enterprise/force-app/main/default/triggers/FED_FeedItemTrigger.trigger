trigger FED_FeedItemTrigger on FeedItem (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    FED_BaseService_151.ServiceConfig config =
        new FED_BaseService_151.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            FED_Domain_158 domain =
                new FED_Domain_158();
            FED_Domain_158.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (FED_Domain_158.ValidationError err : validation.errors) {
                    if (err.severity == FED_Domain_158.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        FED_RecordService_153 service =
            new FED_RecordService_153();
        FED_BaseService_151.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'FED trigger error: ' + error);
            }
        }
    }
}
