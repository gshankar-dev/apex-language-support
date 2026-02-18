trigger GPH_FeedItemTrigger on FeedItem (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    GPH_BaseService_831.ServiceConfig config =
        new GPH_BaseService_831.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            GPH_Domain_838 domain =
                new GPH_Domain_838();
            GPH_Domain_838.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (GPH_Domain_838.ValidationError err : validation.errors) {
                    if (err.severity == GPH_Domain_838.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        GPH_RecordService_833 service =
            new GPH_RecordService_833();
        GPH_BaseService_831.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'GPH trigger error: ' + error);
            }
        }
    }
}
