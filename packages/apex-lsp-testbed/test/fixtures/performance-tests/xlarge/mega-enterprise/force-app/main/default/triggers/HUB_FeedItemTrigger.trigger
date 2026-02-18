trigger HUB_FeedItemTrigger on FeedItem (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    HUB_BaseService_321.ServiceConfig config =
        new HUB_BaseService_321.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            HUB_Domain_328 domain =
                new HUB_Domain_328();
            HUB_Domain_328.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (HUB_Domain_328.ValidationError err : validation.errors) {
                    if (err.severity == HUB_Domain_328.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        HUB_RecordService_323 service =
            new HUB_RecordService_323();
        HUB_BaseService_321.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'HUB trigger error: ' + error);
            }
        }
    }
}
