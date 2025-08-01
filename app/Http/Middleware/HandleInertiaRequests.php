<?php

namespace App\Http\Middleware;

use App\Models\Notification;
use App\Models\CustomizationSetting;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
                'permissions' => fn () => $request -> user()?->getAllPermissions()->pluck("name") ?? [],
                'unreadNotificationsCount' => fn () => $request->user() ? 
                    Notification::forUser($request->user()->id)->unread()->count() : 0,
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'message' => fn () => $request->session()->get('message')
            ],
            'settings' => function () {
                try {
                    return [
                        'current_logo' => CustomizationSetting::getValue('logo'),
                        'current_favicon' => CustomizationSetting::getValue('favicon'),
                        'current_title_text' => CustomizationSetting::getValue('title_text', 'Laravel Starter Kit'),
                        'current_login_picture' => CustomizationSetting::getValue('login_picture'),
                        'login_overlay_opacity' => CustomizationSetting::getValue('login_overlay_opacity', '0.4'),
                    ];
                } catch (\Exception $e) {
                    // Return defaults if database/table doesn't exist yet
                    return [
                        'current_logo' => null,
                        'current_favicon' => null,
                        'current_title_text' => 'Laravel Starter Kit',
                        'current_login_picture' => null,
                        'login_overlay_opacity' => '0.4',
                    ];
                }
            },
        ];
    }
}
