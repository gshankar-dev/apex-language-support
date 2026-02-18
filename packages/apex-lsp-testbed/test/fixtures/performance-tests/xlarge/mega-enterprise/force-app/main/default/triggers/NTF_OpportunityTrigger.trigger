trigger NTF_OpportunityTrigger on Opportunity (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    NTF_BaseService_191.ServiceConfig config =
        new NTF_BaseService_191.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            NTF_Domain_198 domain =
                new NTF_Domain_198();
            NTF_Domain_198.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (NTF_Domain_198.ValidationError err : validation.errors) {
                    if (err.severity == NTF_Domain_198.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        NTF_RecordService_193 service =
            new NTF_RecordService_193();
        NTF_BaseService_191.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'NTF trigger error: ' + error);
            }
        }
    }
}
