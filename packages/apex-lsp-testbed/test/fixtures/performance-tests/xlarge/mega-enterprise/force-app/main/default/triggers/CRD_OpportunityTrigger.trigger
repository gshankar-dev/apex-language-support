trigger CRD_OpportunityTrigger on Opportunity (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    CRD_BaseService_531.ServiceConfig config =
        new CRD_BaseService_531.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            CRD_Domain_538 domain =
                new CRD_Domain_538();
            CRD_Domain_538.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (CRD_Domain_538.ValidationError err : validation.errors) {
                    if (err.severity == CRD_Domain_538.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        CRD_RecordService_533 service =
            new CRD_RecordService_533();
        CRD_BaseService_531.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'CRD trigger error: ' + error);
            }
        }
    }
}
