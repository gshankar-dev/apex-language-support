trigger LED_LeadTrigger on Lead (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    LED_BaseService_31.ServiceConfig config =
        new LED_BaseService_31.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            LED_Domain_38 domain =
                new LED_Domain_38();
            LED_Domain_38.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (LED_Domain_38.ValidationError err : validation.errors) {
                    if (err.severity == LED_Domain_38.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        LED_RecordService_33 service =
            new LED_RecordService_33();
        LED_BaseService_31.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'LED trigger error: ' + error);
            }
        }
    }
}
