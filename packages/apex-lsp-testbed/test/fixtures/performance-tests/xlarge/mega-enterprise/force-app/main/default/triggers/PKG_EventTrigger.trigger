trigger PKG_EventTrigger on Event (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    PKG_BaseService_401.ServiceConfig config =
        new PKG_BaseService_401.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            PKG_Domain_408 domain =
                new PKG_Domain_408();
            PKG_Domain_408.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (PKG_Domain_408.ValidationError err : validation.errors) {
                    if (err.severity == PKG_Domain_408.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        PKG_RecordService_403 service =
            new PKG_RecordService_403();
        PKG_BaseService_401.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'PKG trigger error: ' + error);
            }
        }
    }
}
