trigger TRN_OpportunityTrigger on Opportunity (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    TRN_BaseService_701.ServiceConfig config =
        new TRN_BaseService_701.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            TRN_Domain_708 domain =
                new TRN_Domain_708();
            TRN_Domain_708.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (TRN_Domain_708.ValidationError err : validation.errors) {
                    if (err.severity == TRN_Domain_708.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        TRN_RecordService_703 service =
            new TRN_RecordService_703();
        TRN_BaseService_701.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'TRN trigger error: ' + error);
            }
        }
    }
}
