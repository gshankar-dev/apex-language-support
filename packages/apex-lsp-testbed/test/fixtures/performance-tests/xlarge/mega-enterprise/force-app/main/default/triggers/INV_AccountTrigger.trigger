trigger INV_AccountTrigger on Account (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    INV_BaseService_851.ServiceConfig config =
        new INV_BaseService_851.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            INV_Domain_858 domain =
                new INV_Domain_858();
            INV_Domain_858.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (INV_Domain_858.ValidationError err : validation.errors) {
                    if (err.severity == INV_Domain_858.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        INV_RecordService_853 service =
            new INV_RecordService_853();
        INV_BaseService_851.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'INV trigger error: ' + error);
            }
        }
    }
}
