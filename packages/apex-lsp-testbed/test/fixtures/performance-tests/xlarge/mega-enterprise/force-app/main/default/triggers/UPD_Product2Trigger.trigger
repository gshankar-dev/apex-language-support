trigger UPD_Product2Trigger on Product2 (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    UPD_BaseService_451.ServiceConfig config =
        new UPD_BaseService_451.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            UPD_Domain_458 domain =
                new UPD_Domain_458();
            UPD_Domain_458.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (UPD_Domain_458.ValidationError err : validation.errors) {
                    if (err.severity == UPD_Domain_458.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        UPD_RecordService_453 service =
            new UPD_RecordService_453();
        UPD_BaseService_451.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'UPD trigger error: ' + error);
            }
        }
    }
}
