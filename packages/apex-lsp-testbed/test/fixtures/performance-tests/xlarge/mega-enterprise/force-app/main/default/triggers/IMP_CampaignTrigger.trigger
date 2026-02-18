trigger IMP_CampaignTrigger on Campaign (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    IMP_BaseService_591.ServiceConfig config =
        new IMP_BaseService_591.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            IMP_Domain_598 domain =
                new IMP_Domain_598();
            IMP_Domain_598.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (IMP_Domain_598.ValidationError err : validation.errors) {
                    if (err.severity == IMP_Domain_598.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        IMP_RecordService_593 service =
            new IMP_RecordService_593();
        IMP_BaseService_591.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'IMP trigger error: ' + error);
            }
        }
    }
}
