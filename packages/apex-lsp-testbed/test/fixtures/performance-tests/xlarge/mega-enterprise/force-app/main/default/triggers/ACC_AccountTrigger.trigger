trigger ACC_AccountTrigger on Account (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    ACC_BaseService_01.ServiceConfig config =
        new ACC_BaseService_01.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            ACC_Domain_08 domain =
                new ACC_Domain_08();
            ACC_Domain_08.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (ACC_Domain_08.ValidationError err : validation.errors) {
                    if (err.severity == ACC_Domain_08.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        ACC_RecordService_03 service =
            new ACC_RecordService_03();
        ACC_BaseService_01.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'ACC trigger error: ' + error);
            }
        }
    }
}
