trigger VAL_AssetTrigger on Asset (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    VAL_BaseService_461.ServiceConfig config =
        new VAL_BaseService_461.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            VAL_Domain_468 domain =
                new VAL_Domain_468();
            VAL_Domain_468.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (VAL_Domain_468.ValidationError err : validation.errors) {
                    if (err.severity == VAL_Domain_468.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        VAL_RecordService_463 service =
            new VAL_RecordService_463();
        VAL_BaseService_461.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'VAL trigger error: ' + error);
            }
        }
    }
}
