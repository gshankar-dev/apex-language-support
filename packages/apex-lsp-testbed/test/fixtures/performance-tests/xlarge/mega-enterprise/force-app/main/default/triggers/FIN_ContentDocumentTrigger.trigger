trigger FIN_ContentDocumentTrigger on ContentDocument (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    FIN_BaseService_301.ServiceConfig config =
        new FIN_BaseService_301.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            FIN_Domain_308 domain =
                new FIN_Domain_308();
            FIN_Domain_308.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (FIN_Domain_308.ValidationError err : validation.errors) {
                    if (err.severity == FIN_Domain_308.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        FIN_RecordService_303 service =
            new FIN_RecordService_303();
        FIN_BaseService_301.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'FIN trigger error: ' + error);
            }
        }
    }
}
