trigger FLT_EmailMessageTrigger on EmailMessage (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    FLT_BaseService_821.ServiceConfig config =
        new FLT_BaseService_821.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            FLT_Domain_828 domain =
                new FLT_Domain_828();
            FLT_Domain_828.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (FLT_Domain_828.ValidationError err : validation.errors) {
                    if (err.severity == FLT_Domain_828.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        FLT_RecordService_823 service =
            new FLT_RecordService_823();
        FLT_BaseService_821.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'FLT trigger error: ' + error);
            }
        }
    }
}
