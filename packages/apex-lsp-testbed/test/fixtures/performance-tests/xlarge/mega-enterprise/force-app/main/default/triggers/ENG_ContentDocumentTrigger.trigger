trigger ENG_ContentDocumentTrigger on ContentDocument (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    ENG_BaseService_811.ServiceConfig config =
        new ENG_BaseService_811.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            ENG_Domain_818 domain =
                new ENG_Domain_818();
            ENG_Domain_818.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (ENG_Domain_818.ValidationError err : validation.errors) {
                    if (err.severity == ENG_Domain_818.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        ENG_RecordService_813 service =
            new ENG_RecordService_813();
        ENG_BaseService_811.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'ENG trigger error: ' + error);
            }
        }
    }
}
