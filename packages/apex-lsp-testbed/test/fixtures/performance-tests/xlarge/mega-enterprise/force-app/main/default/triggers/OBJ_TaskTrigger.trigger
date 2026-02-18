trigger OBJ_TaskTrigger on Task (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    OBJ_BaseService_391.ServiceConfig config =
        new OBJ_BaseService_391.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            OBJ_Domain_398 domain =
                new OBJ_Domain_398();
            OBJ_Domain_398.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (OBJ_Domain_398.ValidationError err : validation.errors) {
                    if (err.severity == OBJ_Domain_398.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        OBJ_RecordService_393 service =
            new OBJ_RecordService_393();
        OBJ_BaseService_391.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'OBJ trigger error: ' + error);
            }
        }
    }
}
