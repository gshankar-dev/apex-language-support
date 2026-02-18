trigger DPL_Product2Trigger on Product2 (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    DPL_BaseService_281.ServiceConfig config =
        new DPL_BaseService_281.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            DPL_Domain_288 domain =
                new DPL_Domain_288();
            DPL_Domain_288.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (DPL_Domain_288.ValidationError err : validation.errors) {
                    if (err.severity == DPL_Domain_288.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        DPL_RecordService_283 service =
            new DPL_RecordService_283();
        DPL_BaseService_281.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'DPL trigger error: ' + error);
            }
        }
    }
}
