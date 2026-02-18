trigger ENT_AssetTrigger on Asset (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    ENT_BaseService_291.ServiceConfig config =
        new ENT_BaseService_291.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            ENT_Domain_298 domain =
                new ENT_Domain_298();
            ENT_Domain_298.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (ENT_Domain_298.ValidationError err : validation.errors) {
                    if (err.severity == ENT_Domain_298.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        ENT_RecordService_293 service =
            new ENT_RecordService_293();
        ENT_BaseService_291.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'ENT trigger error: ' + error);
            }
        }
    }
}
