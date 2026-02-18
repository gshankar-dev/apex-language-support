trigger UTL_LeadTrigger on Lead (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    UTL_BaseService_711.ServiceConfig config =
        new UTL_BaseService_711.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            UTL_Domain_718 domain =
                new UTL_Domain_718();
            UTL_Domain_718.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (UTL_Domain_718.ValidationError err : validation.errors) {
                    if (err.severity == UTL_Domain_718.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        UTL_RecordService_713 service =
            new UTL_RecordService_713();
        UTL_BaseService_711.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'UTL trigger error: ' + error);
            }
        }
    }
}
