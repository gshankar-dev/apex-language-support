trigger NET_ContentDocumentTrigger on ContentDocument (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    NET_BaseService_641.ServiceConfig config =
        new NET_BaseService_641.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            NET_Domain_648 domain =
                new NET_Domain_648();
            NET_Domain_648.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (NET_Domain_648.ValidationError err : validation.errors) {
                    if (err.severity == NET_Domain_648.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        NET_RecordService_643 service =
            new NET_RecordService_643();
        NET_BaseService_641.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'NET trigger error: ' + error);
            }
        }
    }
}
