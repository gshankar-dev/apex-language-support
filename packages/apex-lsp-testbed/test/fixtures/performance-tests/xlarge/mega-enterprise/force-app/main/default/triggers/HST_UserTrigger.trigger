trigger HST_UserTrigger on User (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    HST_BaseService_581.ServiceConfig config =
        new HST_BaseService_581.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            HST_Domain_588 domain =
                new HST_Domain_588();
            HST_Domain_588.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (HST_Domain_588.ValidationError err : validation.errors) {
                    if (err.severity == HST_Domain_588.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        HST_RecordService_583 service =
            new HST_RecordService_583();
        HST_BaseService_581.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'HST trigger error: ' + error);
            }
        }
    }
}
