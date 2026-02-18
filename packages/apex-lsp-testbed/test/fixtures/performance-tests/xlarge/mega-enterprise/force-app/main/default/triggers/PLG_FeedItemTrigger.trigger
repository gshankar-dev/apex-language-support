trigger PLG_FeedItemTrigger on FeedItem (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    PLG_BaseService_661.ServiceConfig config =
        new PLG_BaseService_661.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            PLG_Domain_668 domain =
                new PLG_Domain_668();
            PLG_Domain_668.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (PLG_Domain_668.ValidationError err : validation.errors) {
                    if (err.severity == PLG_Domain_668.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        PLG_RecordService_663 service =
            new PLG_RecordService_663();
        PLG_BaseService_661.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'PLG trigger error: ' + error);
            }
        }
    }
}
