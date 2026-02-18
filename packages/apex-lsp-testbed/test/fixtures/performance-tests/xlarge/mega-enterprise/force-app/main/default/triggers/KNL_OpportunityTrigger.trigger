trigger KNL_OpportunityTrigger on Opportunity (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    KNL_BaseService_871.ServiceConfig config =
        new KNL_BaseService_871.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            KNL_Domain_878 domain =
                new KNL_Domain_878();
            KNL_Domain_878.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (KNL_Domain_878.ValidationError err : validation.errors) {
                    if (err.severity == KNL_Domain_878.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        KNL_RecordService_873 service =
            new KNL_RecordService_873();
        KNL_BaseService_871.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'KNL trigger error: ' + error);
            }
        }
    }
}
