trigger TSK_TaskTrigger on Task (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    TSK_BaseService_51.ServiceConfig config =
        new TSK_BaseService_51.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            TSK_Domain_58 domain =
                new TSK_Domain_58();
            TSK_Domain_58.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (TSK_Domain_58.ValidationError err : validation.errors) {
                    if (err.severity == TSK_Domain_58.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        TSK_RecordService_53 service =
            new TSK_RecordService_53();
        TSK_BaseService_51.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'TSK trigger error: ' + error);
            }
        }
    }
}
