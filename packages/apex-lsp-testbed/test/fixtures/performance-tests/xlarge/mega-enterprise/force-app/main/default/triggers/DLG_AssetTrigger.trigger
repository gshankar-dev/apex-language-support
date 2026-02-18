trigger DLG_AssetTrigger on Asset (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    DLG_BaseService_801.ServiceConfig config =
        new DLG_BaseService_801.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            DLG_Domain_808 domain =
                new DLG_Domain_808();
            DLG_Domain_808.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (DLG_Domain_808.ValidationError err : validation.errors) {
                    if (err.severity == DLG_Domain_808.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        DLG_RecordService_803 service =
            new DLG_RecordService_803();
        DLG_BaseService_801.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'DLG trigger error: ' + error);
            }
        }
    }
}
