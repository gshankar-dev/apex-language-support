trigger SYN_EventTrigger on Event (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    SYN_BaseService_231.ServiceConfig config =
        new SYN_BaseService_231.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            SYN_Domain_238 domain =
                new SYN_Domain_238();
            SYN_Domain_238.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (SYN_Domain_238.ValidationError err : validation.errors) {
                    if (err.severity == SYN_Domain_238.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        SYN_RecordService_233 service =
            new SYN_RecordService_233();
        SYN_BaseService_231.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'SYN trigger error: ' + error);
            }
        }
    }
}
