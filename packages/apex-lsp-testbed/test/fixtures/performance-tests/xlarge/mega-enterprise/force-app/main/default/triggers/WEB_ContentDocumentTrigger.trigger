trigger WEB_ContentDocumentTrigger on ContentDocument (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    WEB_BaseService_471.ServiceConfig config =
        new WEB_BaseService_471.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            WEB_Domain_478 domain =
                new WEB_Domain_478();
            WEB_Domain_478.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (WEB_Domain_478.ValidationError err : validation.errors) {
                    if (err.severity == WEB_Domain_478.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        WEB_RecordService_473 service =
            new WEB_RecordService_473();
        WEB_BaseService_471.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'WEB trigger error: ' + error);
            }
        }
    }
}
