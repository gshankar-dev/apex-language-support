trigger YLD_FeedItemTrigger on FeedItem (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    YLD_BaseService_491.ServiceConfig config =
        new YLD_BaseService_491.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            YLD_Domain_498 domain =
                new YLD_Domain_498();
            YLD_Domain_498.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (YLD_Domain_498.ValidationError err : validation.errors) {
                    if (err.severity == YLD_Domain_498.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        YLD_RecordService_493 service =
            new YLD_RecordService_493();
        YLD_BaseService_491.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'YLD trigger error: ' + error);
            }
        }
    }
}
