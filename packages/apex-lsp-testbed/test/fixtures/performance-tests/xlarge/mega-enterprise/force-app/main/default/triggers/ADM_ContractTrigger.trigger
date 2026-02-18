trigger ADM_ContractTrigger on Contract (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    ADM_BaseService_771.ServiceConfig config =
        new ADM_BaseService_771.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            ADM_Domain_778 domain =
                new ADM_Domain_778();
            ADM_Domain_778.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (ADM_Domain_778.ValidationError err : validation.errors) {
                    if (err.severity == ADM_Domain_778.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        ADM_RecordService_773 service =
            new ADM_RecordService_773();
        ADM_BaseService_771.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'ADM trigger error: ' + error);
            }
        }
    }
}
