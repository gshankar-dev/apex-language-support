trigger LNK_OpportunityTrigger on Opportunity (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    LNK_BaseService_361.ServiceConfig config =
        new LNK_BaseService_361.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            LNK_Domain_368 domain =
                new LNK_Domain_368();
            LNK_Domain_368.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (LNK_Domain_368.ValidationError err : validation.errors) {
                    if (err.severity == LNK_Domain_368.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        LNK_RecordService_363 service =
            new LNK_RecordService_363();
        LNK_BaseService_361.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'LNK trigger error: ' + error);
            }
        }
    }
}
