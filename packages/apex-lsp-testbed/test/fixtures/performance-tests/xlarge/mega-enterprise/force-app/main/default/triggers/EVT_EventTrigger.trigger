trigger EVT_EventTrigger on Event (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    EVT_BaseService_61.ServiceConfig config =
        new EVT_BaseService_61.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            EVT_Domain_68 domain =
                new EVT_Domain_68();
            EVT_Domain_68.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (EVT_Domain_68.ValidationError err : validation.errors) {
                    if (err.severity == EVT_Domain_68.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        EVT_RecordService_63 service =
            new EVT_RecordService_63();
        EVT_BaseService_61.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'EVT trigger error: ' + error);
            }
        }
    }
}
