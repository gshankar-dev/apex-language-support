trigger DOC_ContentDocumentTrigger on ContentDocument (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    DOC_BaseService_131.ServiceConfig config =
        new DOC_BaseService_131.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            DOC_Domain_138 domain =
                new DOC_Domain_138();
            DOC_Domain_138.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (DOC_Domain_138.ValidationError err : validation.errors) {
                    if (err.severity == DOC_Domain_138.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        DOC_RecordService_133 service =
            new DOC_RecordService_133();
        DOC_BaseService_131.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'DOC trigger error: ' + error);
            }
        }
    }
}
