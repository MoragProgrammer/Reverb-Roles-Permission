<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Notification;
use App\Models\User;

class CleanupOrphanedNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:cleanup-orphaned';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up orphaned notifications where users are no longer assigned to the forms';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧹 Starting cleanup of orphaned notifications...');
        
        $orphanedCount = 0;
        $totalCount = 0;
        
        // Get all notifications with their forms and users
        $notifications = Notification::with(['form.users', 'form.roles', 'user'])
            ->whereIn('type', [
                Notification::TYPE_FORM_ASSIGNED,
                Notification::TYPE_FORM_REJECTED,
                Notification::TYPE_FORM_COMPLETED
            ])
            ->get();
        
        $this->info("📊 Found {$notifications->count()} notifications to check...");
        
        foreach ($notifications as $notification) {
            $totalCount++;
            
            // Skip if notification doesn't have a valid form or user
            if (!$notification->form || !$notification->user) {
                $this->warn("❌ Removing notification #{$notification->id} - Missing form or user");
                $notification->delete();
                $orphanedCount++;
                continue;
            }
            
            $user = $notification->user;
            $form = $notification->form;
            
            // Check if user is directly assigned to this form
            $isDirectlyAssigned = $form->users->contains('id', $user->id);
            
            // Check if user is assigned through roles
            $isAssignedThroughRoles = false;
            foreach ($form->roles as $role) {
                if ($user->hasRole($role->name)) {
                    $isAssignedThroughRoles = true;
                    break;
                }
            }
            
            $isActuallyAssigned = $isDirectlyAssigned || $isAssignedThroughRoles;
            
            if (!$isActuallyAssigned) {
                $this->warn("❌ Removing orphaned notification #{$notification->id} for user '{$user->email}' and form '{$form->title}'");
                $notification->delete();
                $orphanedCount++;
            } else {
                $assignmentType = $isDirectlyAssigned ? 'direct' : 'role-based';
                $this->line("✅ Keeping notification #{$notification->id} - User assigned via {$assignmentType}");
            }
        }
        
        $cleanCount = $totalCount - $orphanedCount;
        
        $this->newLine();
        $this->info("🎉 Cleanup completed!");
        $this->table(
            ['Status', 'Count'],
            [
                ['Total Checked', $totalCount],
                ['Orphaned (Removed)', $orphanedCount],
                ['Valid (Kept)', $cleanCount]
            ]
        );
        
        if ($orphanedCount > 0) {
            $this->warn("⚠️  Removed {$orphanedCount} orphaned notifications.");
            $this->info("💡 Users should no longer see forms they're not assigned to.");
        } else {
            $this->info("✨ No orphaned notifications found. Database is clean!");
        }
        
        return 0;
    }
}
