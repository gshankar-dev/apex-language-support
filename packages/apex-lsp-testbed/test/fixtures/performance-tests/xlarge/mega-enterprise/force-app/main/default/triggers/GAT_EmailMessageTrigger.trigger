trigger GAT_EmailMessageTrigger on EmailMessage (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    GAT_BaseService_311.ServiceConfig config =
        new GAT_BaseService_311.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            GAT_Domain_318 domain =
                new GAT_Domain_318();
            GAT_Domain_318.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (GAT_Domain_318.ValidationError err : validation.errors) {
                    if (err.severity == GAT_Domain_318.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        GAT_RecordService_313 service =
            new GAT_RecordService_313();
        GAT_BaseService_311.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'GAT trigger error: ' + error);
            }
        }
    }
}
