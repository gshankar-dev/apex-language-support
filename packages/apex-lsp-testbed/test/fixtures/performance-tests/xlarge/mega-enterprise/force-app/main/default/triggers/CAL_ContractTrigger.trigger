trigger CAL_ContractTrigger on Contract (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    CAL_BaseService_261.ServiceConfig config =
        new CAL_BaseService_261.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            CAL_Domain_268 domain =
                new CAL_Domain_268();
            CAL_Domain_268.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (CAL_Domain_268.ValidationError err : validation.errors) {
                    if (err.severity == CAL_Domain_268.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        CAL_RecordService_263 service =
            new CAL_RecordService_263();
        CAL_BaseService_261.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'CAL trigger error: ' + error);
            }
        }
    }
}
