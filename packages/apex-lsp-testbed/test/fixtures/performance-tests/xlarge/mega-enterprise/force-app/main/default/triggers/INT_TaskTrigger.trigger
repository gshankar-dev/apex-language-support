trigger INT_TaskTrigger on Task (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    INT_BaseService_221.ServiceConfig config =
        new INT_BaseService_221.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            INT_Domain_228 domain =
                new INT_Domain_228();
            INT_Domain_228.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (INT_Domain_228.ValidationError err : validation.errors) {
                    if (err.severity == INT_Domain_228.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        INT_RecordService_223 service =
            new INT_RecordService_223();
        INT_BaseService_221.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'INT trigger error: ' + error);
            }
        }
    }
}
