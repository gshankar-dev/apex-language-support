trigger WRK_TaskTrigger on Task (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    WRK_BaseService_731.ServiceConfig config =
        new WRK_BaseService_731.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            WRK_Domain_738 domain =
                new WRK_Domain_738();
            WRK_Domain_738.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (WRK_Domain_738.ValidationError err : validation.errors) {
                    if (err.severity == WRK_Domain_738.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        WRK_RecordService_733 service =
            new WRK_RecordService_733();
        WRK_BaseService_731.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'WRK trigger error: ' + error);
            }
        }
    }
}
