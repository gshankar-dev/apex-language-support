trigger CNT_ContactTrigger on Contact (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    CNT_BaseService_11.ServiceConfig config =
        new CNT_BaseService_11.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            CNT_Domain_18 domain =
                new CNT_Domain_18();
            CNT_Domain_18.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (CNT_Domain_18.ValidationError err : validation.errors) {
                    if (err.severity == CNT_Domain_18.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        CNT_RecordService_13 service =
            new CNT_RecordService_13();
        CNT_BaseService_11.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'CNT trigger error: ' + error);
            }
        }
    }
}
