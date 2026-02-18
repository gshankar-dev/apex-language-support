trigger JSN_ContractTrigger on Contract (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    JSN_BaseService_601.ServiceConfig config =
        new JSN_BaseService_601.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            JSN_Domain_608 domain =
                new JSN_Domain_608();
            JSN_Domain_608.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (JSN_Domain_608.ValidationError err : validation.errors) {
                    if (err.severity == JSN_Domain_608.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        JSN_RecordService_603 service =
            new JSN_RecordService_603();
        JSN_BaseService_601.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'JSN trigger error: ' + error);
            }
        }
    }
}
