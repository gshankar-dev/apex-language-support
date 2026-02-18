trigger MAP_AssetTrigger on Asset (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    MAP_BaseService_631.ServiceConfig config =
        new MAP_BaseService_631.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            MAP_Domain_638 domain =
                new MAP_Domain_638();
            MAP_Domain_638.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (MAP_Domain_638.ValidationError err : validation.errors) {
                    if (err.severity == MAP_Domain_638.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        MAP_RecordService_633 service =
            new MAP_RecordService_633();
        MAP_BaseService_631.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'MAP trigger error: ' + error);
            }
        }
    }
}
