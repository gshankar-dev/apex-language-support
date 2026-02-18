trigger SCH_ContractTrigger on Contract (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    SCH_BaseService_431.ServiceConfig config =
        new SCH_BaseService_431.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            SCH_Domain_438 domain =
                new SCH_Domain_438();
            SCH_Domain_438.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (SCH_Domain_438.ValidationError err : validation.errors) {
                    if (err.severity == SCH_Domain_438.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        SCH_RecordService_433 service =
            new SCH_RecordService_433();
        SCH_BaseService_431.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'SCH trigger error: ' + error);
            }
        }
    }
}
