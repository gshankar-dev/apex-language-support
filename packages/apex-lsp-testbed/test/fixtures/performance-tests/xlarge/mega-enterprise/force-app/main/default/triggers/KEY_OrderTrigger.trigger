trigger KEY_OrderTrigger on Order (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    KEY_BaseService_611.ServiceConfig config =
        new KEY_BaseService_611.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            KEY_Domain_618 domain =
                new KEY_Domain_618();
            KEY_Domain_618.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (KEY_Domain_618.ValidationError err : validation.errors) {
                    if (err.severity == KEY_Domain_618.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        KEY_RecordService_613 service =
            new KEY_RecordService_613();
        KEY_BaseService_611.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'KEY trigger error: ' + error);
            }
        }
    }
}
