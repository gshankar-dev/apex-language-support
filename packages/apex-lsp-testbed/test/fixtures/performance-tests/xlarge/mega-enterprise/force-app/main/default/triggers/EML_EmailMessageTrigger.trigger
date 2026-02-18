trigger EML_EmailMessageTrigger on EmailMessage (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    EML_BaseService_141.ServiceConfig config =
        new EML_BaseService_141.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            EML_Domain_148 domain =
                new EML_Domain_148();
            EML_Domain_148.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (EML_Domain_148.ValidationError err : validation.errors) {
                    if (err.severity == EML_Domain_148.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        EML_RecordService_143 service =
            new EML_RecordService_143();
        EML_BaseService_141.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'EML trigger error: ' + error);
            }
        }
    }
}
